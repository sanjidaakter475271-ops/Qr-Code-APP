import React, { useEffect, useRef } from "react";
import QRCodeStyling, {
  DotType,
  CornerSquareType,
  CornerDotType,
} from "qr-code-styling";

interface StyledQRCodeProps {
  data: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  dotsType?: DotType;
  cornersSquareType?: CornerSquareType;
  cornersDotType?: CornerDotType;
  isGradient?: boolean;
  logo?: string | null;
  logoSize?: number;
  logoMargin?: number;
}

export default function StyledQRCode({
  data,
  size = 200,
  fgColor = "#000000",
  bgColor = "#ffffff",
  dotsType = "square",
  cornersSquareType = "square",
  cornersDotType = "square",
  isGradient = false,
  logo = null,
  logoSize = 0.4,
  logoMargin = 0,
}: StyledQRCodeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);

  const getGradient = (color: string) => {
    if (!isGradient) return undefined;
    return {
      type: "radial" as const,
      rotation: 0,
      colorStops: [
        { offset: 0, color: color },
        { offset: 1, color: "#444444" },
      ],
    };
  };

  useEffect(() => {
    qrCode.current = new QRCodeStyling({
      width: size,
      height: size,
      data: data,
      margin: 0,
      image: logo || undefined,
      qrOptions: {
        typeNumber: 0,
        mode: "Byte",
        errorCorrectionLevel: "H",
      },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: logoSize,
        margin: logoMargin,
        crossOrigin: "anonymous",
      },
      dotsOptions: {
        type: dotsType,
        color: fgColor,
        gradient: getGradient(fgColor),
      },
      backgroundOptions: {
        color: bgColor,
      },
      cornersSquareOptions: {
        type: cornersSquareType,
        color: fgColor,
        gradient: getGradient(fgColor),
      },
      cornersDotOptions: {
        type: cornersDotType,
        color: fgColor,
        gradient: getGradient(fgColor),
      },
    });

    if (ref.current) {
      ref.current.innerHTML = "";
      qrCode.current.append(ref.current);
    }
  }, []);

  useEffect(() => {
    if (!qrCode.current) return;
    qrCode.current.update({
      width: size,
      height: size,
      data: data,
      image: logo || undefined,
      imageOptions: {
        imageSize: logoSize,
        margin: logoMargin,
      },
      dotsOptions: {
        type: dotsType,
        color: fgColor,
        gradient: getGradient(fgColor),
      },
      backgroundOptions: {
        color: bgColor,
      },
      cornersSquareOptions: {
        type: cornersSquareType,
        color: fgColor,
        gradient: getGradient(fgColor),
      },
      cornersDotOptions: {
        type: cornersDotType,
        color: fgColor,
        gradient: getGradient(fgColor),
      },
    });
  }, [
    data,
    size,
    fgColor,
    bgColor,
    dotsType,
    cornersSquareType,
    cornersDotType,
    isGradient,
    logo,
    logoSize,
    logoMargin,
  ]);

  return <div ref={ref} />;
}
