import { ProdutoImagemResponseDto } from '../dto/produto.response.dto';


export function produtoImagemDataUrl(imagem: ProdutoImagemResponseDto | null | undefined): string | null {
  if (!imagem?.imagem) return null;

  let base64: string;
  if (typeof imagem.imagem === 'string') {
    base64 = imagem.imagem.replace(/^data:[^;]+;base64,/, '');
  } else {
    if (imagem.imagem.length === 0) return null;
    let binario = '';
    for (let inicio = 0; inicio < imagem.imagem.length; inicio += 0x8000) {
      const bloco = imagem.imagem.slice(inicio, inicio + 0x8000).map(byte => byte & 0xff);
      binario += String.fromCharCode(...bloco);
    }
    base64 = btoa(binario);
  }

  if (!base64) return null;
  const tipo = tipoImagem(base64, imagem.nomeArquivo);
  return `data:${tipo};base64,${base64}`;
}

function tipoImagem(base64: string, nomeArquivo: string | null): string {
  if (base64.startsWith('/9j/')) return 'image/jpeg';
  if (base64.startsWith('iVBOR')) return 'image/png';
  if (base64.startsWith('UklGR')) return 'image/webp';

  const extensao = nomeArquivo?.split('.').pop()?.toLocaleLowerCase('pt-BR');
  if (extensao === 'jpg' || extensao === 'jpeg') return 'image/jpeg';
  if (extensao === 'png') return 'image/png';
  if (extensao === 'webp') return 'image/webp';
  return 'application/octet-stream';
}
