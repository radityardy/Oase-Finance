import TransactionForm from "@/components/forms/TransactionForm";

export default function NewTransactionPage() {
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Add Transaction</h1>
                <p className="mt-1 text-sm text-slate-500">
                Record income, expense, or move money.
                </p>
            </div>
       </div>
       
       <TransactionForm />
    </div>
  );
}
