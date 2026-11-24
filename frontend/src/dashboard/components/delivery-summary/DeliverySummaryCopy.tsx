import { DeliveryReviewLink } from "./DeliveryReviewLink";

export function DeliverySummaryCopy({
  selectedName,
  headline,
  description,
}: {
  selectedName?: string;
  headline: string;
  description: string;
}) {
  return (
    <div className="delivery-hero-copy">
      <span className="delivery-hero-label">{selectedName ?? "Organization overview"}</span>
      <h2 id="delivery-hero-title">{headline}</h2>
      <p>{description}</p>
      <DeliveryReviewLink />
    </div>
  );
}
