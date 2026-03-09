class CsrfManager {
  private token: string = '';

  setToken(token: string) {
    this.token = token;
  }

  getToken() {
    return this.token;
  }

  getHeaders(): Record<string, string> {
    return this.token ? { 'CSRF-Token': this.token } : {};
  }
}

export const csrfManager = new CsrfManager();

export const initCsrf = async () => {
  try {
    const response = await fetch('/api/csrf-token', {
      credentials: 'include'
    });
    const data = await response.json();
    csrfManager.setToken(data.csrfToken);
  } catch (error) {
    console.error('Ошибка инициализации CSRF токена:', error);
  }
};