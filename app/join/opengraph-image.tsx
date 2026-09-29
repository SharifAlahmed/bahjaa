/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";

export const alt =
  "بهجة — المعرفة لم تعد هي المشكلة. المشكلة هي: ماذا نفعل بكل ما نعرفه؟";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        dir="rtl"
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "rgb(247,245,238)",
          color: "rgb(21,51,42)",
          padding: "64px 76px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <img
            src="https://bahjaa.com/logo/bahjaa-logo.png"
            width="112"
            height="112"
            alt=""
            style={{ objectFit: "contain" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: "980px" }}>
          <div
            style={{
              fontSize: 64,
              lineHeight: 1.25,
              fontWeight: 700,
              letterSpacing: "-1px",
            }}
          >
            المعرفة لم تعد هي المشكلة.
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: 52,
              lineHeight: 1.35,
              fontWeight: 700,
            }}
          >
            المشكلة هي: ماذا نفعل بكل ما نعرفه؟
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgb(230,236,233)",
            paddingTop: 22,
            fontSize: 26,
            color: "rgb(23,127,94)",
          }}
        >
          <span>معرفة تطبيقية للقادة ورواد الأعمال</span>
          <span style={{ color: "rgb(142,106,41)", fontSize: 22 }}>bahjaa.com/join</span>
        </div>
      </div>
    ),
    size,
  );
}
