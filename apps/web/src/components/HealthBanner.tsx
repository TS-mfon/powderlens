type HealthBannerProps = {
  backendAvailable: boolean;
  message: string;
};

export function HealthBanner({ backendAvailable, message }: HealthBannerProps) {
  if (backendAvailable) {
    return null;
  }

  return (
    <div className="health-banner" role="status">
      <strong>Degraded functionality mode:</strong> {message}
    </div>
  );
}
