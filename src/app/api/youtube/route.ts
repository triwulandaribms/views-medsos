
import { NextRequest } from 'next/server';
import { getYoutubeData } from '@/src/services/youtubeService';
import { ok, fail } from '@/src/lib/utils';

export async function GET(req: NextRequest) {

  try {

    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
      return fail('Username required', 400);
    }

    const data = await getYoutubeData(username);

    return ok('Success fetch youtube data', data);
  } catch (err: any) {
    return fail(err.message || 'Internal server error', 500);
  }

}




