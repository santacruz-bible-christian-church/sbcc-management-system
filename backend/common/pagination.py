from rest_framework.pagination import PageNumberPagination


class CustomPageNumberPagination(PageNumberPagination):
    page_size = 10  # Default page size
    page_size_query_param = "page_size"  # Allow client to set via ?page_size=N
    max_page_size = 1000  # Prevent abuse (max 1000 items per request)
