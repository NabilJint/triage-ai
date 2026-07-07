export function AuthBackground() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-0"
      style={{
        backgroundImage: `
          radial-gradient(circle at top right, var(--color-primary-muted), transparent 40%),
          radial-gradient(circle at bottom left, var(--color-primary-light), transparent 30%)
        `,
      }}
    />
  );
}
