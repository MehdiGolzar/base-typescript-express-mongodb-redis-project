export enum SharedSuccessMessages {
  SUCCESS = "درخواست با موفقیت انجام شد",
}

export enum SharedErrorMessages {
  INTERNAL_SERVER_ERROR = "خطای سرور",
  UNAUTHORIZED_TOKEN = "توکن نامعتبر است یا منقضی شده است",
  UNAUTHORIZED_API_KEY = " API key نامعتبر است یا منقضی شده است",
  FORBIDDEN = "دسترسی غیر مجاز",
  INVALID_REQUEST_DATA = "داده های ارسالی معتبر نمی باشد",
  TOO_MANY_REQUESTS = "تعداد درخواست ها بیشتر از حد مجاز است",
  ROUTE_NOT_FOUND = "مسیر پیدا نشد",
}
