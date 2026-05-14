from django.contrib import admin
from apps.expenses.models import Expense, ExpenseApproval, ExpenseFlag

admin.site.register(Expense)
admin.site.register(ExpenseApproval)
admin.site.register(ExpenseFlag)
