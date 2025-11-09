import { NextRequest, NextResponse } from 'next/server';
import { walletTagging } from '@/lib/wallet-tagging';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const tagId = searchParams.get('tagId');
    const walletAddress = searchParams.get('walletAddress');

    if (action === 'get-tag' && tagId) {
      const tag = walletTagging.getTag(tagId);
      return NextResponse.json({
        success: true,
        data: { tag },
      });
    }

    if (action === 'wallet-tags' && walletAddress) {
      const tags = walletTagging.getWalletTags(walletAddress);
      return NextResponse.json({
        success: true,
        data: { tags },
      });
    }

    if (action === 'tagged-wallet' && walletAddress) {
      const tagged = walletTagging.getTaggedWallet(walletAddress);
      return NextResponse.json({
        success: true,
        data: { wallet: tagged },
      });
    }

    if (action === 'wallets-by-tag' && tagId) {
      const wallets = walletTagging.getWalletsByTag(tagId);
      return NextResponse.json({
        success: true,
        data: { wallets },
      });
    }

    if (action === 'tag-stats' && tagId) {
      const stats = walletTagging.getTagStatistics(tagId);
      return NextResponse.json({
        success: true,
        data: stats,
      });
    }

    if (action === 'all-stats') {
      const stats = walletTagging.getAllTagStatistics();
      return NextResponse.json({
        success: true,
        data: { statistics: stats },
      });
    }

    if (action === 'search') {
      const name = searchParams.get('name') || undefined;
      const category = searchParams.get('category') || undefined;

      const tags = walletTagging.searchTags({ name, category });
      return NextResponse.json({
        success: true,
        data: { tags },
      });
    }

    // Default: get all tags
    const tags = walletTagging.getAllTags();
    return NextResponse.json({
      success: true,
      data: { tags },
    });
  } catch (error: any) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, tag, tagId, updates, walletAddress, tagIds, logic, walletAddresses } = body;

    if (action === 'create-tag') {
      if (!tag) {
        return NextResponse.json(
          { error: 'Tag is required' },
          { status: 400 }
        );
      }

      const created = walletTagging.createTag(tag);
      return NextResponse.json({
        success: true,
        data: { tag: created },
      });
    }

    if (action === 'update-tag') {
      if (!tagId || !updates) {
        return NextResponse.json(
          { error: 'Tag ID and updates are required' },
          { status: 400 }
        );
      }

      const updated = walletTagging.updateTag(tagId, updates);
      return NextResponse.json({
        success: updated,
        data: { updated },
      });
    }

    if (action === 'delete-tag') {
      if (!tagId) {
        return NextResponse.json(
          { error: 'Tag ID is required' },
          { status: 400 }
        );
      }

      const deleted = walletTagging.deleteTag(tagId);
      return NextResponse.json({
        success: deleted,
        data: { deleted },
      });
    }

    if (action === 'assign-tag') {
      if (!walletAddress || !tagId) {
        return NextResponse.json(
          { error: 'Wallet address and tag ID are required' },
          { status: 400 }
        );
      }

      const assigned = walletTagging.assignTag(walletAddress, tagId, body.notes);
      return NextResponse.json({
        success: assigned,
        data: { assigned },
      });
    }

    if (action === 'remove-tag') {
      if (!walletAddress || !tagId) {
        return NextResponse.json(
          { error: 'Wallet address and tag ID are required' },
          { status: 400 }
        );
      }

      const removed = walletTagging.removeTag(walletAddress, tagId);
      return NextResponse.json({
        success: removed,
        data: { removed },
      });
    }

    if (action === 'wallets-by-tags') {
      if (!tagIds || !Array.isArray(tagIds)) {
        return NextResponse.json(
          { error: 'Tag IDs array is required' },
          { status: 400 }
        );
      }

      const wallets = walletTagging.getWalletsByTags(tagIds, logic || 'OR');
      return NextResponse.json({
        success: true,
        data: { wallets },
      });
    }

    if (action === 'bulk-assign') {
      if (!walletAddresses || !tagId) {
        return NextResponse.json(
          { error: 'Wallet addresses and tag ID are required' },
          { status: 400 }
        );
      }

      const result = walletTagging.bulkAssignTag(walletAddresses, tagId);
      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error processing tags:', error);
    return NextResponse.json(
      { error: 'Failed to process tags', message: error.message },
      { status: 500 }
    );
  }
}

