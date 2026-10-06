import Image from "next/image";

/** Static visual backdrop for the landing hero. */
export function HeroVideo() {
  return (
    <div className="v2-hero-media" aria-hidden="true">
      <Image className="v2-hero-poster" src="/template-art/other-professional.png" alt="" fill priority sizes="100vw" />
      <span className="v2-hero-video-overlay" />
    </div>
  );
}
