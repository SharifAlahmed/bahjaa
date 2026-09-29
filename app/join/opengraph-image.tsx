import { ImageResponse } from "next/og";

export const alt = "بهجة — المعرفة لم تعد هي المشكلة. المشكلة هي: ماذا نفعل بكل ما نعرفه؟";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const [regular, bold] = await Promise.all([
    fetch("https://raw.githubusercontent.com/googlefonts/tajawal/main/fonts/ttf/Tajawal-Regular.ttf").then((res) => res.arrayBuffer()),
    fetch("https://raw.githubusercontent.com/googlefonts/tajawal/main/fonts/ttf/Tajawal-Bold.ttf").then((res) => res.arrayBuffer()),
  ]);

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
          background: "rgb(247, 245, 238)",
          color: "rgb(21, 51, 42)",
          padding: "58px 72px",
          fontFamily: "Tajawal",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <img
            src="https://bahjaa.com/logo/bahjaa-logo.png"
            width="118"
            height="118"
            alt=""
            style={{ objectFit: "contain" }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              border: "1px solid rgb(230, 236, 233)",
              borderRadius: "9999px",
              padding: "10px 20px",
              color: "rgb(23, 127, 94)",
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            معرفة تطبيقية للقادة ورواد الأعمال
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: "1010px" }}>
          <div
            style={{
              display: "flex",
              fontSize: 57,
              lineHeight: 1.35,
              fontWeight: 700,
              letterSpacing: "-1px",
            }}
          >
            المعرفة لم تعد هي المشكلة.
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 8,
              fontSize: 57,
              lineHeight: 1.35,
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
            gap: 14,
            color: "rgb(142, 106, 41)",
            fontSize: 23,
          }}
        >
          <div
            style={{
              width: 52,
              height: 3,
              display: "flex",
              background: "rgb(201, 154, 69)",
            }}
          />
          <span>نشرة بهجة الأسبوعية</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Tajawal", data: regular, weight: 400 },
        { name: "Tajawal", data: bold, weight: 700 },
      ],
    }
  );
}
