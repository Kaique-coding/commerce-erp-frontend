import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PedidoRequestDto, PedidoResponseDto } from '../dto/pedido.dto';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api`;

  criar(pedido: PedidoRequestDto): Observable<PedidoResponseDto> {
    return this.http.post<PedidoResponseDto>(`${this.baseUrl}/pedidos`, pedido)
      .pipe(catchError(this.tratarErro));
  }

  listar(): Observable<PedidoResponseDto[]> {
    return this.http.get<PedidoResponseDto[]>(`${this.baseUrl}/pedidos`)
      .pipe(catchError(this.tratarErro));
  }

  private tratarErro(error: HttpErrorResponse): Observable<never> {
    const body = error.error as { mensagem?: string; detail?: string } | null;
    const mensagem = body?.mensagem ?? body?.detail;
    const fallback = error.status === 0
      ? 'Não foi possível conectar ao servidor.'
      : error.status === 401
        ? 'Sua sessão expirou. Entre novamente.'
        : error.status >= 500
          ? 'Ocorreu um erro interno ao processar o pedido.'
          : 'Não foi possível processar o pedido.';
    return throwError(() => new Error(mensagem ?? fallback));
  }
}
