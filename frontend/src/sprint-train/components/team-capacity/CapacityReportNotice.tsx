export function CapacityReportNotice({
  message,
  error = false,
}: {
  message: string;
  error?: boolean;
}) {
  return (
    <p
      className={error ? "capacity-notice capacity-danger" : "capacity-notice"}
      role={error ? "alert" : "status"}
    >
      {message}
    </p>
  );
}
