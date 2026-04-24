const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <div className="h-dvh bg-amber-50">{children}</div>;
};

export default layout;
