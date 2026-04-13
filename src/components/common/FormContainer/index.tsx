export function FormContainer({ children }: { children: React.ReactNode }) {
    return <div className="flex flex-col gap-3 w-full border border-card-border bg-card p-3 rounded-2xl">{children}</div>;
}
