import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { renderToBuffer } from "@react-pdf/renderer";
import { SimulationPDF } from "@/lib/simulation/pdf-template";
import React from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { propertyId } = body;

    if (!propertyId) {
      return NextResponse.json(
        { error: "propertyId is required" },
        { status: 400 },
      );
    }

    // 最新のシミュレーション結果を取得
    const simulation = await prisma.simulation.findFirst({
      where: { propertyId },
      orderBy: { createdAt: "desc" },
      include: { property: true },
    });

    if (!simulation) {
      return NextResponse.json(
        { error: "Simulation not found. Please run simulation first." },
        { status: 404 },
      );
    }

    const resultData = JSON.parse(simulation.results);

    // PDF生成
    const element = React.createElement(SimulationPDF, { data: resultData });
    const buffer = await renderToBuffer(element as any);

    const propertyTitle = resultData.property?.title || "simulation";
    const fileName = `収益シミュレーション_${propertyTitle.substring(0, 20)}.pdf`;

    return new NextResponse(buffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      {
        error: "PDF generation failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
