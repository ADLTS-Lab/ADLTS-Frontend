import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, updateCandidateStatus } from '../../../_mock-auth';

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> | { id: string } }
) {
  const resolvedParams = props.params && 'then' in props.params ? await props.params : props.params;
  const id = resolvedParams?.id;

  if (!id) {
    return NextResponse.json({ success: false, message: 'Candidate ID is required.' }, { status: 400 });
  }

  // 1. Authenticate user from Bearer Token
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
  }

  // 2. Authorize role (Admin or SuperAdmin only)
  if (user.role !== 'admin' && user.role !== 'super_admin') {
    return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 });
  }

  // 3. Read and validate status from request body
  let body: any;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Invalid JSON body.' }, { status: 400 });
  }

  const status = body?.status;
  if (!status || (status !== 'active' && status !== 'suspended')) {
    return NextResponse.json(
      { success: false, message: "Status must be either 'active' or 'suspended'." },
      { status: 400 }
    );
  }

  // 4. Update state
  const updatedCandidate = updateCandidateStatus(id, status);
  if (!updatedCandidate) {
    return NextResponse.json({ success: false, message: 'Candidate not found.' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    message: 'Candidate status updated successfully.',
    data: updatedCandidate,
  });
}
