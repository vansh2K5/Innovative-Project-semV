export * from './helmet-config';
export * from './session-manager';
export * from './activity-logger';
export * from './threat-detector';
export * from './keycloak-auth';
export * from './winston-logger';

import helmetConfig from './helmet-config';
import sessionManager from './session-manager';
import activityLogger from './activity-logger';
import threatDetector from './threat-detector';
import keycloakAuth from './keycloak-auth';
import { securityLogger } from './winston-logger';

export const security = {
  helmet: helmetConfig,
  sessions: sessionManager,
  logger: activityLogger,
  threats: threatDetector,
  keycloak: keycloakAuth,
  winston: securityLogger,
};

export default security;
