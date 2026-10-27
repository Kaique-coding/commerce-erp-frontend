import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

import { environment }        from '../../../environments/environment';
import { UsuarioRequestDto }  from '../dto/usuario.request.dto';
import { UsuarioResponseDto } from '../dto/usuario.response.dto';















@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http    = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api`;

  cadastrar(dto: UsuarioRequestDto): Observable<UsuarioResponseDto> {
    return this.http
      .post<UsuarioResponseDto>(`${this.baseUrl}/usuario`, dto)
      .pipe(catchError(this.handleError));
  }

  cadastrarInterno(dto: UsuarioRequestDto): Observable<UsuarioResponseDto> {
    return this.http
      .post<UsuarioResponseDto>(`${this.baseUrl}/usuario/interno`, dto)
      .pipe(catchError(this.handleError));
  }

  listar(): Observable<UsuarioResponseDto[]> {
    return this.http
      .get<UsuarioResponseDto[]>(`${this.baseUrl}/usuarios`)
      .pipe(catchError(this.handleError));
  }

  buscarPorId(id: string): Observable<UsuarioResponseDto> {
    return this.http
      .get<UsuarioResponseDto>(`${this.baseUrl}/usuario/${id}`)
      .pipe(catchError(this.handleError));
  }

  atualizar(id: string, dto: UsuarioRequestDto): Observable<UsuarioResponseDto> {
    return this.http
      .put<UsuarioResponseDto>(`${this.baseUrl}/usuario/${id}`, dto)
      .pipe(catchError(this.handleError));
  }

  excluir(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/usuario/${id}`)
      .pipe(catchError(this.handleError));
  }

  atualizarStatus(id: string, ativo: boolean): Observable<UsuarioResponseDto> {
    const params = new HttpParams().set('ativo', String(ativo));
    return this.http
      .patch<UsuarioResponseDto>(`${this.baseUrl}/usuario/${id}/status`, null, { params })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const backendMessage = (error.error as { mensagem?: string })?.mensagem;

    let fallback: string;
    if (error.status === 0) {
      fallback = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
    } else if (error.status === 401) {
      fallback = 'Sua sessão expirou. Entre novamente para carregar os usuários.';
    } else if (error.status === 403) {
      fallback = 'Você não tem permissão para consultar os usuários.';
    } else if (error.status === 409) {
      fallback = 'Já existe um usuário cadastrado com este e-mail ou CPF.';
    } else if (error.status >= 500) {
      fallback = 'Erro interno do servidor. Tente novamente mais tarde.';
    } else {
      fallback = 'Ocorreu um erro inesperado. Tente novamente.';
    }

    return throwError(() => new Error(backendMessage ?? fallback));
  }
}
