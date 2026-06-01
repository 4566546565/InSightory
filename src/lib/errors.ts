export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code: string = "BAD_REQUEST"
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "资源不存在") {
    super(message, 404, "NOT_FOUND");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "请先登录") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "权限不足") {
    super(message, 403, "FORBIDDEN");
  }
}

export function apiSuccess<T>(data: T, pagination?: { page: number; pageSize: number; total: number }) {
  return Response.json(
    { success: true, data, ...(pagination && { pagination }) },
    { status: 200 }
  );
}

export function apiError(error: unknown) {
  if (error instanceof AppError) {
    return Response.json(
      { success: false, error: { code: error.code, message: error.message } },
      { status: error.statusCode }
    );
  }
  console.error("Unhandled error:", error);
  return Response.json(
    { success: false, error: { code: "INTERNAL_ERROR", message: "服务器内部错误" } },
    { status: 500 }
  );
}
