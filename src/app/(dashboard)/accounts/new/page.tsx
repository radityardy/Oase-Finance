import AccountForm from "@/components/forms/AccountForm";

export default function NewAccountPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add New Account</h1>
        <p className="mt-1 text-sm text-slate-500">
          Add a bank account, e-wallet, or cash stash to track.
        </p>
      </div>
      
      <div className="bg-white shadow sm:rounded-lg p-6">
        <AccountForm />
      </div>
    </div>
  );
}
