import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { RevokeApiData } from "@/types/api/key";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(): Promise<NextResponse<RevokeApiData>> {
  try {
    const user = await getServerSession(authOptions).then((res) => res?.user);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    const existingApiKey = await db.apiKey.findFirst({
      where: { userId: user.id, enabled: true },
    });
    if (!existingApiKey) {
      return NextResponse.json(
        {
          error: "This API key could not be revoked.",
          success: false,
        },
        {
          status: 500,
        }
      );
    }

    // invalidate API key
    await db.apiKey.update({
      where: { id: existingApiKey.id },
      data: {
        enabled: false,
      },
    });

    return NextResponse.json({ error: null, success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues, success: false },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error", success: false },
      { status: 500 }
    );
  }
}
