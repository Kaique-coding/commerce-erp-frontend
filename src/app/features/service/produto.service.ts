import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

import { environment }       from '../../../environments/environment';
import { ProdutoRequestDto } from '../dto/produto.request.dto';
import { ProdutoResponseDto } from '../dto/produto.response.dto';












@Injectable({ providedIn: 'root' })
export class ProdutoService {
  private readonly http    = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api`;

  listar(): Observable<ProdutoResponseDto[]> {
    return this.http
      .get<ProdutoResponseDto[]>(`${this.baseUrl}/produtos`)
      .pipe(catchError(this.handleError));
  }

  buscarPorId(id: string): Observable<ProdutoResponseDto> {
    return this.http
      .get<ProdutoResponseDto>(`${this.baseUrl}/produto/${id}`)
      .pipe(catchError(this.handleError));
  }

  criar(dto: ProdutoRequestDto): Observable<ProdutoResponseDto> {
    return this.http
      .post<ProdutoResponseDto>(`${this.baseUrl}/produto`, dto)
      .pipe(catchError(this.handleError));
  }

  atualizar(id: string, dto: ProdutoRequestDto): Observable<ProdutoResponseDto> {
    return this.http
      .put<ProdutoResponseDto>(`${this.baseUrl}/produto/${id}`, dto)
      .pipe(catchError(this.handleError));
  }

  excluir(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/produto/${id}`)
      .pipe(catchError(this.handleError));
  }

  atualizarStatus(id: string, ativo: boolean): Observable<ProdutoResponseDto> {
    const params = new HttpParams().set('ativo', String(ativo));
    return this.http
      .patch<ProdutoResponseDto>(`${this.baseUrl}/produto/${id}/status`, null, { params })
      .pipe(catchError(this.handleError));
  }



  private handleError(error: HttpErrorResponse): Observable<never> {
    const backendMessage = (error.error as { mensagem?: string })?.mensagem;

    let fallback: string;
    if (error.status === 0) {
      fallback = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
    } else if (error.status === 404) {
      fallback = 'Produto não encontrado.';
    } else if (error.status >= 500) {
      fallback = 'Erro interno do servidor. Tente novamente mais tarde.';
    } else {
      fallback = 'Ocorreu um erro inesperado. Tente novamente.';
    }

    return throwError(() => new Error(backendMessage ?? fallback));
  }
}
