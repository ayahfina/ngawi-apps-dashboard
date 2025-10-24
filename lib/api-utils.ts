import { NextRequest, NextResponse } from 'next/server';
import { auth } from './auth';
import { z } from 'zod';

// Generic response format
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// Generic success response
export function createSuccessResponse<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
    return NextResponse.json({
        success: true,
        data,
        message,
    });
}

// Generic error response
export function createErrorResponse(message: string, status: number = 400): NextResponse<ApiResponse> {
    return NextResponse.json({
        success: false,
        error: message,
    }, { status });
}

// Authentication middleware
export async function authenticate(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            throw new Error('Unauthorized');
        }

        return session;
    } catch (error) {
        throw new Error('Unauthorized');
    }
}

// Pagination parameters
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// Generic pagination response
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

// Extract pagination from query params
export function extractPaginationParams(searchParams: URLSearchParams): PaginationParams {
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    return {
        page: Math.max(1, page),
        limit: Math.min(100, Math.max(1, limit)),
        sortBy,
        sortOrder,
    };
}

// Calculate pagination metadata
export function calculatePagination<T>(
    data: T[],
    page: number,
    limit: number,
    total: number
): PaginatedResponse<T> {
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext,
            hasPrev,
        },
    };
}

// Common validation schemas
export const paginationSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    sortBy: z.string().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Search filter schema
export const searchSchema = z.object({
    search: z.string().optional(),
    ...paginationSchema.shape,
});

// Status filter schema
export const statusFilterSchema = z.object({
    status: z.string().optional(),
    ...searchSchema.shape,
});