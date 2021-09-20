import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

interface PartnerData {
  id: string;
  name: string;
}

export class MissingFieldError extends Error {}

export function addCorsHeader(result: APIGatewayProxyResult) {
  result.headers = {
    'Content-type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': '*',
  };
}

export function getEventBody(event: APIGatewayProxyEvent) {
  return typeof event.body == 'object' ? event.body : JSON.parse(event.body);
}

export function validatePartnerData(partner: PartnerData): PartnerData {
  if (!partner.name) {
    throw new MissingFieldError('Value for name required!');
  }
  return {
    id: `${Date.now()}`,
    name: partner.name,
  };
}
