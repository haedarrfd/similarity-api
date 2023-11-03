import { cosineSimilarity } from "@/helpers/cosine-sim";
import { db } from "@/lib/db";
import { openai } from "@/lib/openai";
import { SimilarityData } from "@/types/api/key";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

const reqSchema = z.object({
  text1: z.string().max(1000),
  text2: z.string().max(1000),
});

export async function POST(
  req: Request
): Promise<NextResponse<SimilarityData>> {
  const body = await req.json();

  const apiKey = headers().get("authorization");
  if (!apiKey) {
    return NextResponse.json(
      { error: "Unauthorized", success: false },
      { status: 401 }
    );
  }

  try {
    const { text1, text2 } = reqSchema.parse(body);

    const validApiKey = await db.apiKey.findFirst({
      where: {
        key: apiKey,
        enabled: true,
      },
    });
    if (!validApiKey) {
      return NextResponse.json(
        { error: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    const start = new Date();

    const embeddings = await Promise.all(
      [text1, text2].map(async (text) => {
        const res = await openai.createEmbedding({
          model: "text-embedding-ada-002",
          input: text,
        });

        return res.data.data[0].embedding;
      })
    );

    const similarity = cosineSimilarity(embeddings[0], embeddings[1]);

    const duration = new Date().getTime() - start.getTime();

    const url = new URL(req.url as string).pathname;

    // Persist request
    await db.apiRequest.create({
      data: {
        duration,
        method: req.method as string,
        path: url,
        status: 200,
        apiKeyId: validApiKey.id,
        usedApiKey: validApiKey.key,
      },
    });

    return NextResponse.json(
      { success: true, text1, text2, similarity },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues, success: true },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
