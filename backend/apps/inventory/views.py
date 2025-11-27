from datetime import date
from decimal import Decimal
from io import BytesIO

from django.http import HttpResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import InventoryTracking
from .serializers import InventoryTrackingSerializer


class InventoryTrackingViewSet(viewsets.ModelViewSet):
    queryset = InventoryTracking.objects.all()
    serializer_class = InventoryTrackingSerializer
    permission_classes = [permissions.AllowAny]

    # ...existing code (perform_create, perform_update, printable_list)...

    @action(detail=False, methods=["get"], url_path="report-pdf")
    def report_pdf(self, request):
        qs = self.get_queryset().order_by("item_name")

        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            leftMargin=2 * cm,
            rightMargin=2 * cm,
            topMargin=2 * cm,
            bottomMargin=2 * cm,
        )

        styles = getSampleStyleSheet()
        elements = []

        elements.append(Paragraph("Inventory & Depreciation Report", styles["Title"]))
        elements.append(Paragraph(date.today().strftime("Generated on %Y-%m-%d"), styles["Normal"]))
        elements.append(Spacer(1, 0.5 * cm))

        table_data = [
            [
                "ID",
                "Item",
                "Qty",
                "Status",
                "Acquired",
                "Cost",
                "Salvage",
                "Useful Life (yrs)",
                "Book Value",
            ]
        ]

        for item in qs:
            acquisition_date = item.acquisition_date

            # ensure Decimal
            cost = item.acquisition_cost or Decimal("0")
            salvage = item.salvage_value or Decimal("0")
            useful_life = item.useful_life_years or 1

            # years_used as Decimal (avoid mixing with float)
            if acquisition_date:
                days_used = Decimal((date.today() - acquisition_date).days)
                years_used = max(Decimal("0"), days_used / Decimal("365"))
            else:
                years_used = Decimal("0")

            depreciable_base = max(Decimal("0"), cost - salvage)
            annual_dep = (
                depreciable_base / Decimal(useful_life) if useful_life > 0 else Decimal("0")
            )
            accumulated_dep = min(depreciable_base, annual_dep * years_used)
            book_value = max(Decimal("0"), cost - accumulated_dep)

            table_data.append(
                [
                    str(item.id),
                    item.item_name,
                    str(item.quantity),
                    item.status,
                    acquisition_date.isoformat() if acquisition_date else "",
                    f"{cost:,.2f}",
                    f"{salvage:,.2f}",
                    str(useful_life),
                    f"{book_value:,.2f}",
                ]
            )

        table = Table(table_data, repeatRows=1)
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.black),
                    ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("ALIGN", (0, 0), (-1, 0), "CENTER"),
                    ("ALIGN", (0, 1), (0, -1), "CENTER"),
                    ("ALIGN", (4, 1), (-1, -1), "RIGHT"),
                    ("FONTSIZE", (0, 0), (-1, -1), 8),
                ]
            )
        )

        elements.append(table)
        doc.build(elements)

        pdf_value = buffer.getvalue()
        buffer.close()

        response = HttpResponse(content_type="application/pdf")
        response["Content-Disposition"] = 'attachment; filename="inventory_depreciation_report.pdf"'
        response.write(pdf_value)
        return response
