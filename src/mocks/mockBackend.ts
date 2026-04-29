const rolesEnum = { admin: 'admin' } as const;
const cerberusUtils = {
    setUserRole: (_role: string): void => { localStorage.setItem('userRole', _role); },
    setCerberusToken: (_token: string): void => { localStorage.setItem('cerberusToken', _token); }
};

import {
    referenceAlertsResponse,
    referenceClientId,
    referenceClientResponse,
    referenceCmoConnectionsResponse,
    referenceCsvExport,
    referenceRegistrationHistoryResponse,
    referenceRepertoireResponse,
    referenceStatementsResponse
} from './referenceData';

declare global {
    // Global flags keep the mock fetch bootstrap idempotent across hot reloads and tests.
    // eslint-disable-next-line no-unused-vars
    interface Window {
        __NR_UI_REFERENCE_FETCH_INSTALLED__?: boolean;
        __NR_UI_REFERENCE_ORIGINAL_FETCH__?: typeof fetch;
        __NR_UI_REFERENCE_BOOTSTRAPPED__?: boolean;
    }
}

interface MutableClientData extends Record<string, unknown> {
    legalCompanyName?: string;
    comments?: string;
}

type MutableConnection = (typeof referenceCmoConnectionsResponse.data)[number];

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

let mutableClient = clone(referenceClientResponse.data) as MutableClientData;
let mutableConnections = clone(referenceCmoConnectionsResponse.data) as MutableConnection[];

const jsonResponse = (body: unknown, status: number = 200): Response =>
    new Response(JSON.stringify(body), {
        status,
        headers: {
            'Content-Type': 'application/json'
        }
    });

const fileResponse = (contents: string, fileName: string): Response =>
    new Response(contents, {
        status: 200,
        headers: {
            'Content-Type': 'text/csv',
            'content-disposition': `attachment; filename="${fileName}"`
        }
    });

const getRequestUrl = (input: RequestInfo | URL): URL => {
    if (typeof input === 'string' || input instanceof URL) {
        return new URL(String(input), window.location.origin);
    }

    return new URL(input.url, window.location.origin);
};

const getRequestMethod = (input: RequestInfo | URL, init?: RequestInit): string => {
    if (init?.method) {
        return init.method.toUpperCase();
    }

    if (typeof input !== 'string' && !(input instanceof URL)) {
        return input.method.toUpperCase();
    }

    return 'GET';
};

const parseJsonBody = async (init?: RequestInit): Promise<Record<string, unknown>> => {
    const body = init?.body;

    if (typeof body !== 'string' || body.length === 0) {
        return {};
    }

    try {
        const parsed = JSON.parse(body) as unknown;
        return typeof parsed === 'object' && parsed !== null
            ? (parsed as Record<string, unknown>)
            : {};
    } catch {
        return {};
    }
};

const getPathSegments = (pathname: string): string[] =>
    pathname
        .split('/')
        .filter(Boolean)
        .slice(2);

const matchPath = (pathname: string, path: string): boolean => pathname === `/api/mock${path}`;

const handleReadRequests = (pathname: string, searchParams: URLSearchParams): Response | null => {
    if (pathname === `/api/mock/rh-client/${referenceClientId}`) {
        return jsonResponse({
            ...referenceClientResponse,
            data: mutableClient
        });
    }

    if (pathname === `/api/mock/asset/rh/${referenceClientId}`) {
        return jsonResponse(referenceRepertoireResponse);
    }

    if (pathname === '/api/mock/statements/by-client') {
        return jsonResponse(referenceStatementsResponse);
    }

    if (pathname === `/api/mock/client/cmo-connection-by-client-id/${referenceClientId}`) {
        return jsonResponse({
            data: mutableConnections
        });
    }

    if (pathname === '/api/mock/territories/all') {
        return jsonResponse({
            data: []
        });
    }

    if (pathname === '/api/mock/async/event/active-status') {
        const clientId = searchParams.get('clientId');
        if (clientId === referenceClientId) {
            return jsonResponse({
                requestUUID: 'reference-active-status',
                data: []
            });
        }
    }

    if (pathname.startsWith('/api/mock/cmo/registration-history/')) {
        return jsonResponse(referenceRegistrationHistoryResponse);
    }

    if (pathname.startsWith('/api/mock/alert/')) {
        return jsonResponse(referenceAlertsResponse);
    }

    return null;
};

const handleMutationRequests = async (
    pathname: string,
    method: string,
    init?: RequestInit
): Promise<Response | null> => {
    if (pathname === '/api/mock/rh-client' && method === 'PATCH') {
        const payload = await parseJsonBody(init);
        mutableClient = {
            ...mutableClient,
            ...(payload.legalCompanyName
                ? { legalCompanyName: String(payload.legalCompanyName) }
                : {}),
            ...(payload.comments ? { comments: String(payload.comments) } : {})
        };

        return jsonResponse({
            requestUUID: 'reference-update-client',
            data: {
                clientId: referenceClientId,
                success: true
            }
        });
    }

    if (pathname === `/api/mock/asset/export/rh/${referenceClientId}` && method === 'POST') {
        return fileResponse(referenceCsvExport, 'reference-repertoire.csv');
    }

    if (pathname === `/api/mock/curve/sync-assets/rh/${referenceClientId}` && method === 'POST') {
        return jsonResponse({
            requestUUID: 'reference-sync-assets',
            data: {
                accepted: true
            }
        });
    }

    if (pathname.startsWith('/api/mock/cmo/delete-client-cmo-registration/') && method === 'DELETE') {
        const pathSegments = getPathSegments(pathname);
        const registrationId = pathSegments[pathSegments.length - 1];
        mutableConnections = mutableConnections.filter(
            (connection) => String(connection.cmoRegId) !== registrationId
        );

        return jsonResponse({
            requestUUID: 'reference-delete-cmo-registration',
            data: {
                success: true
            }
        });
    }

    if (matchPath(pathname, '/cmo/change-reg-state') && method === 'PATCH') {
        const payload = await parseJsonBody(init);
        const registrationId = String(payload.clientCmoRegistrationId ?? '');
        const nextStatus = String(payload.registrationStatus ?? 'SUBMITTED');

        mutableConnections = mutableConnections.map((connection) =>
            String(connection.cmoRegId) === registrationId
                ? {
                      ...connection,
                      registrationStatus: nextStatus,
                      statusDate: new Date().toISOString()
                  }
                : connection
        );

        return jsonResponse({
            requestUUID: 'reference-change-registration-status',
            data: [
                {
                    id: {
                        clientCmoRegistrationId: registrationId,
                        newStatus: nextStatus,
                        statusDate: new Date().toISOString()
                    }
                }
            ]
        });
    }

    if (matchPath(pathname, '/alert') && (method === 'POST' || method === 'PATCH')) {
        return jsonResponse({
            requestUUID: 'reference-alert-write',
            data: {
                success: true
            }
        });
    }

    if (pathname.startsWith('/api/mock/alert/resolve/') && method === 'GET') {
        return jsonResponse({
            requestUUID: 'reference-alert-resolve',
            data: {
                success: true
            }
        });
    }

    return null;
};

const handleMockRequest = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = getRequestUrl(input);
    const method = getRequestMethod(input, init);
    const { pathname, searchParams } = url;

    const readResponse = handleReadRequests(pathname, searchParams);
    if (readResponse) {
        return readResponse;
    }

    const mutationResponse = await handleMutationRequests(pathname, method, init);
    if (mutationResponse) {
        return mutationResponse;
    }

    console.warn(`[reference-app] Unhandled mock request: ${method} ${pathname}`);
    return jsonResponse({
        requestUUID: 'reference-fallback',
        data: {}
    });
};

export const resetReferenceMockState = (): void => {
    mutableClient = clone(referenceClientResponse.data) as MutableClientData;
    mutableConnections = clone(referenceCmoConnectionsResponse.data) as MutableConnection[];
};

export const bootstrapReferenceApp = (): void => {
    if (window.__NR_UI_REFERENCE_BOOTSTRAPPED__) {
        return;
    }

    resetReferenceMockState();
    cerberusUtils.setUserRole(rolesEnum.admin);
    cerberusUtils.setCerberusToken('reference-ui-token');

    if (!window.__NR_UI_REFERENCE_FETCH_INSTALLED__) {
        window.__NR_UI_REFERENCE_ORIGINAL_FETCH__ = window.fetch.bind(window);
        window.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> =>
            handleMockRequest(input, init);
        window.__NR_UI_REFERENCE_FETCH_INSTALLED__ = true;
    }

    window.__NR_UI_REFERENCE_BOOTSTRAPPED__ = true;
};
