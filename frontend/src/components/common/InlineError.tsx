export function InlineError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" style={{ fontSize: 11.5, color: 'var(--danger)', margin: '2px 0 0' }}>
      {message}
    </p>
  );
}
