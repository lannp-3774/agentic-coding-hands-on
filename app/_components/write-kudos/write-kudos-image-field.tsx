import { useId, useRef, type ChangeEvent } from "react";
import type { WriteKudosFieldErrors, WriteKudosImage } from "@/lib/kudos/write-kudos-types";
import { FieldError, FieldLabel } from "./write-kudos-field-parts";
import { WriteKudosCloseTinyIcon, WriteKudosPlusIcon, WriteKudosSpinnerIcon } from "./write-kudos-icons";
import type { WriteKudosImagesProps, WriteKudosModalLabels } from "./write-kudos-modal-types";

type Props = {
  labels: WriteKudosModalLabels;
  images: WriteKudosImagesProps;
  errors: WriteKudosFieldErrors;
};

type ThumbnailProps = {
  image: WriteKudosImage;
  position: number;
  labels: WriteKudosModalLabels;
  onRemove: (key: string) => void;
};

function WriteKudosImageThumbnail({ image, position, labels, onRemove }: ThumbnailProps) {
  const name = `${labels.imageAlt} ${position}`;
  return (
    // mm:I520:11647;662:9197 — mms_F.2_Image (wrapper: 80px, 18px radius, #998C5F border)
    <div aria-busy={image.status === "uploading"} className="relative size-20 shrink-0 rounded-[18px] border border-[#998C5F] bg-white">
      {/* mm:I520:11647;662:9197;256:4717 — MM_MEDIA_Sample Image (the uploaded file's preview) */}
      {/* eslint-disable-next-line @next/next/no-img-element -- blob: object URL preview, not optimisable */}
      <img
        src={image.previewUrl}
        alt={name}
        // -inset-px + max-w-none: the 80x80 image covers the wrapper's border box (Figma), not its 78x78 padding box
        className={`absolute -inset-px size-20 max-w-none rounded border bg-[#D3D3D3] object-cover ${
          image.status === "error" ? "border-[#CF1322] opacity-60" : "border-[#FFEA9E]"
        }`}
      />
      {image.status === "uploading" ? (
        <span aria-hidden="true" className="absolute -inset-px flex items-center justify-center rounded bg-[#00101A]/40 text-white">
          <WriteKudosSpinnerIcon className="animate-spin motion-reduce:animate-none" />
        </span>
      ) : null}
      {/* mm:I520:11647;662:9197;662:9287 — Button (red remove badge, overhangs the corner by 8px) */}
      <button
        type="button"
        aria-label={`${labels.removeAction} ${name}`}
        onClick={() => onRemove(image.key)}
        className="absolute -top-2 -right-2 flex size-5 cursor-pointer items-center justify-center rounded-full bg-[#D4271D] p-[1.43px] text-white transition-transform duration-200 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E] motion-reduce:transition-none"
      >
        {/* mm:I520:11647;662:9197;662:9287;186:1420 — MM_MEDIA_Close Tiny */}
        <WriteKudosCloseTinyIcon />
      </button>
    </div>
  );
}

/** F — "Image" label, thumbnails with remove badges, "+ Image" (hidden at the cap) and the hidden file input. */
export function WriteKudosImageField({ labels, images, errors }: Props) {
  const id = useId();
  const labelId = `${id}-label`;
  const errorId = `${id}-error`;
  const inputRef = useRef<HTMLInputElement>(null);
  const code = errors.images;

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    // Copy before clearing: resetting `value` empties the live FileList.
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length > 0) images.onFilesSelected(files);
  };

  return (
    // mm:I520:11647;520:9896 — mms_F_Frame 537
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      {/* mm:I520:11647;520:9897 — mms_F.1_Title */}
      <FieldLabel id={labelId} className="sm:w-[74px]">
        {labels.imageLabel}
      </FieldLabel>
      <div role="group" aria-labelledby={labelId} aria-describedby={code ? errorId : undefined} className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-4">
          {images.items.map((image, index) => (
            <WriteKudosImageThumbnail key={image.key} image={image} position={index + 1} labels={labels} onRemove={images.onRemove} />
          ))}
          {images.items.length < images.max ? (
            // mm:I520:11647;662:9132 — mms_F.5_Frame 542 (+ Image)
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex h-12 cursor-pointer items-center gap-1 rounded-lg border border-[#998C5F] bg-white px-2 py-1 text-left transition-colors duration-200 hover:bg-[#FFEA9E]/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E] motion-reduce:transition-none"
            >
              {/* mm:I520:11647;662:9133;186:2759 — MM_MEDIA_Plus */}
              <WriteKudosPlusIcon className="shrink-0 text-[#998C5F]" />
              <span className="flex flex-col">
                <span className="text-base leading-[22px] font-bold tracking-[0.15px] text-[#00101A]">{labels.imageAdd}</span>
                <span className="text-[11px] leading-4 font-bold tracking-[0.5px] text-[#999]">{labels.imageLimitNote}</span>
              </span>
            </button>
          ) : null}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png"
            multiple
            tabIndex={-1}
            aria-hidden="true"
            onChange={onChange}
            className="sr-only"
          />
        </div>
        <FieldError id={errorId} message={code ? labels.errors[code] : null} alert />
      </div>
    </div>
  );
}
