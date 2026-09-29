import { ImageResponse } from "next/og";

export const alt = "بهجة — المعرفة لم تعد هي المشكلة. المشكلة هي: ماذا نفعل بكل ما نعرفه؟";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
          padding: "66px 76px",
          fontFamily: "sans-serif",
          color: "rgb(21,51,42)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            insetInlineEnd: "-90px",
            insetBlockStart: "-110px",
            width: "360px",
            height: "360px",
            border: "2px solid rgb(201,154,69)",
            borderRadius: "999px",
            opacity: 0.22,
          }}
        />

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <img
            src="https://bahjaa.com/logo/bahjaa-logo.png"
            width="164"
            height="auto"
            alt=""
            style={{ objectFit: "contain" }}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "920px",
            gap: "8px",
          }}
        >
          <div
            style={{
              fontSize: "31px",
              lineHeight: 1.45,
              color: "rgb(23,127,94)",
            }}
          >
            المعرفة لم تعد هي المشكلة.
          </div>
          <div
            style={{
              fontSize: "60px",
              lineHeight: 1.34,
              fontWeight: 700,
              letterSpacing: "-1px",
            }}
          >
            المشكلة هي: ماذا نفعل بكل ما نعرفه؟
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            fontSize: "24px",
            color: "rgba(21,51,42,.72)",
          }}
        >
          <div
            style={{
              width: "46px",
              height: "3px",
              background: "rgb(201,154,69)",
              borderRadius: "999px",
            }}
          />
          معرفة تطبيقية للقادة ورواد الأعمال
        </div>
      </div>
    ),
    size
  );
}
