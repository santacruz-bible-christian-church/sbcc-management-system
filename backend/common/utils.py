"""Common utility functions"""

from datetime import datetime
from decimal import Decimal


def calculate_age(date_of_birth):
    """Calculate age from date of birth"""
    today = datetime.now().date()
    return (
        today.year
        - date_of_birth.year
        - ((today.month, today.day) < (date_of_birth.month, date_of_birth.day))
    )


def calculate_depreciation(cost, acquisition_date, depreciation_rate):
    """
    Calculate current value with depreciation

    Args:
        cost: Original cost (Decimal)
        acquisition_date: Date of acquisition
        depreciation_rate: Annual depreciation rate (percentage)

    Returns:
        Current value after depreciation
    """
    years = (datetime.now().date() - acquisition_date).days / 365.25
    depreciation_amount = cost * (Decimal(str(depreciation_rate)) / 100) * Decimal(str(years))
    return max(cost - depreciation_amount, Decimal("0.00"))


def format_currency(amount):
    """Format as Philippine Peso"""
    return f"₱{amount:,.2f}"


def get_fiscal_year(date=None):
    """Get fiscal year for the church (assuming Jan-Dec)"""
    if date is None:
        date = datetime.now().date()
    return date.year
