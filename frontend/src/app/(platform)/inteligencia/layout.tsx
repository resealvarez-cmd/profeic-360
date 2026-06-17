export default function InteligenciaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 w-full bg-[#f8fafc] min-h-screen">
      {children}
    </div>
  );
}
