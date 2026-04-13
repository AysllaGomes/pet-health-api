export interface HealthcheckResponse {
  status: 'ok' | 'error';
  database: 'ok' | 'down';
  timestamp: string;
}
