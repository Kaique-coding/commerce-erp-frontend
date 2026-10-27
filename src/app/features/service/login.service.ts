import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LoginRequestDto }  from '../dto/login.request.dto';
import { LoginResponseDto } from '../dto/login.response.dto';








@Injectable({ providedIn: 'root' })
export class LoginService {
  private readonly http = inject(HttpClient);

  private readonly loginUrl = `${environment.apiUrl}/api/login`;





  login(credentials: LoginRequestDto): Observable<LoginResponseDto> {
    return this.http
      .post<LoginResponseDto>(this.loginUrl, credentials)
      .pipe(catchError(this.handleError));
  }



  private handleError(error: HttpErrorResponse): Observable<never> {

    const backendMessage = (error.error as { mensagem?: string })?.mensagem;

    let fallback: string;

    if (error.status === 0) {
      fallback = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
    } else if (error.status >= 500) {
      fallback = 'Erro interno do servidor. Tente novamente mais tarde.';
    } else {
      fallback = 'Ocorreu um erro inesperado. Tente novamente.';
    }

    return throwError(() => new Error(backendMessage ?? fallback));
  }
}
