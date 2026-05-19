import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bin = searchParams.get("bin");
    const acc = searchParams.get("acc");
    const name = searchParams.get("name");
    const amount = searchParams.get("amount");
    const content = searchParams.get("content");

    if (!bin || !acc || !amount) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const encodedAddInfo = encodeURIComponent(content || "");
    const encodedName = encodeURIComponent(name || "");
    const apiUrl =
      `https://api.vietqr.io/v2/gateway/qr?binCode=${bin}` +
      `&accNumber=${acc}` +
      `&amount=${amount}` +
      `&addInfo=${encodedAddInfo}` +
      `&accountName=${encodedName}` +
      `&template=compact`;

    const response = await fetch(apiUrl, {
      headers: { "Content-Type": "application/json" },
      redirect: "follow",
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("VietQR API error:", response.status, text);
      return NextResponse.json({ error: "Failed to generate QR" }, { status: 502 });
    }

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("image")) {
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const mimeType = contentType.includes("png") ? "image/png" : "image/jpeg";
      return NextResponse.json({ data: { qrDataURL: `data:${mimeType};base64,${base64}` } });
    }

    const data = await response.json();
    if (data.data?.qrDataURL) {
      return NextResponse.json(data);
    }

    console.error("VietQR unexpected response:", data);
    return NextResponse.json({ error: "Invalid response from VietQR" }, { status: 502 });
  } catch (error) {
    console.error("VietQR route error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
