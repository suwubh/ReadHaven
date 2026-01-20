// app/api/reading-goal/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { year, target } = body;

    if (!year || !target) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (target < 1 || target > 1000) {
      return NextResponse.json(
        { error: 'Target must be between 1 and 1000' },
        { status: 400 }
      );
    }

    // Check if goal exists for this year
    const existingGoal = await prisma.readingGoal.findUnique({
      where: {
        userId_year: {
          userId: session.user.id,
          year,
        },
      },
    });

    let goal;

    if (existingGoal) {
      // Update existing goal
      goal = await prisma.readingGoal.update({
        where: {
          id: existingGoal.id,
        },
        data: {
          target,
        },
      });
    } else {
      // Create new goal
      goal = await prisma.readingGoal.create({
        data: {
          userId: session.user.id,
          year,
          target,
        },
      });
    }

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error('Reading goal error:', error);
    return NextResponse.json(
      { error: 'Failed to save reading goal' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    const goal = await prisma.readingGoal.findUnique({
      where: {
        userId_year: {
          userId: session.user.id,
          year,
        },
      },
    });

    return NextResponse.json(goal);
  } catch (error) {
    console.error('Fetch reading goal error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reading goal' },
      { status: 500 }
    );
  }
}