import { NextRequest, NextResponse } from 'next/server';
import { addressBookManager } from '@/lib/address-book';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');
    const action = searchParams.get('action');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    if (action === 'search') {
      const search = searchParams.get('search') || undefined;
      const tags = searchParams.get('tags')?.split(',');
      const isTrusted = searchParams.get('isTrusted') === 'true' ? true : searchParams.get('isTrusted') === 'false' ? false : undefined;
      const isContract = searchParams.get('isContract') === 'true' ? true : searchParams.get('isContract') === 'false' ? false : undefined;
      const chainId = searchParams.get('chainId') ? parseInt(searchParams.get('chainId')!) : undefined;
      const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

      const results = addressBookManager.searchAddresses(walletAddress, {
        search,
        tags,
        isTrusted,
        isContract,
        chainId,
        limit,
      });

      return NextResponse.json({
        success: true,
        data: { addresses: results },
      });
    }

    if (action === 'stats') {
      const stats = addressBookManager.getStatistics(walletAddress);
      return NextResponse.json({
        success: true,
        data: stats,
      });
    }

    if (action === 'tags') {
      const tags = addressBookManager.getAllTags(walletAddress);
      return NextResponse.json({
        success: true,
        data: { tags: Array.from(tags) },
      });
    }

    if (action === 'groups') {
      const groups = addressBookManager.getAllGroups(walletAddress);
      return NextResponse.json({
        success: true,
        data: { groups },
      });
    }

    // Default: get all addresses
    const addresses = addressBookManager.getAllAddresses(walletAddress);
    return NextResponse.json({
      success: true,
      data: { addresses },
    });
  } catch (error: any) {
    console.error('Error fetching address book:', error);
    return NextResponse.json(
      { error: 'Failed to fetch address book', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, action } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    if (action === 'add') {
      const entry = await addressBookManager.addAddress(walletAddress, body.entry);
      return NextResponse.json({
        success: true,
        data: { entry },
      });
    }

    if (action === 'update') {
      const { address, updates } = body;
      const entry = addressBookManager.updateAddress(walletAddress, address, updates);
      return NextResponse.json({
        success: true,
        data: { entry },
      });
    }

    if (action === 'remove') {
      const { address } = body;
      const removed = addressBookManager.removeAddress(walletAddress, address);
      return NextResponse.json({
        success: removed,
        data: { removed },
      });
    }

    if (action === 'usage') {
      const { address } = body;
      addressBookManager.recordUsage(walletAddress, address);
      return NextResponse.json({
        success: true,
        data: { message: 'Usage recorded' },
      });
    }

    if (action === 'create-group') {
      const group = addressBookManager.createGroup(walletAddress, body.group);
      return NextResponse.json({
        success: true,
        data: { group },
      });
    }

    if (action === 'add-to-group') {
      const { groupId, addressId } = body;
      const added = addressBookManager.addAddressToGroup(walletAddress, groupId, addressId);
      return NextResponse.json({
        success: added,
        data: { added },
      });
    }

    if (action === 'export') {
      const addressBook = addressBookManager.exportAddressBook(walletAddress);
      return NextResponse.json({
        success: true,
        data: addressBook,
      });
    }

    if (action === 'import') {
      const { addressBook } = body;
      addressBookManager.importAddressBook(walletAddress, addressBook);
      return NextResponse.json({
        success: true,
        data: { message: 'Address book imported' },
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error processing address book:', error);
    return NextResponse.json(
      { error: 'Failed to process address book', message: error.message },
      { status: 500 }
    );
  }
}

