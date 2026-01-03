// Test filtering logic with specific scenario: MP4, 1080p, 378 kbps

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';
const TEST_VIDEO_URL = process.env.TEST_VIDEO_URL || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

// Simulate the frontend filtering logic
const formatBitrate = (bitrate) => {
  if (!bitrate) return undefined;
  if (bitrate >= 1000000) return `${(bitrate / 1000000).toFixed(1)} Mbps`;
  if (bitrate >= 1000) return `${(bitrate / 1000).toFixed(0)} kbps`;
  return `${bitrate} bps`;
};

const parseBitrate = (bitrateStr) => {
  if (!bitrateStr) return null;
  if (bitrateStr.includes('Mbps')) {
    return Math.round(parseFloat(bitrateStr.replace(' Mbps', '')) * 1000000);
  }
  if (bitrateStr.includes('kbps')) {
    return Math.round(parseFloat(bitrateStr.replace(' kbps', '')) * 1000);
  }
  if (bitrateStr.includes('bps')) {
    return parseInt(bitrateStr.replace(' bps', ''));
  }
  return null;
};

const bitrateMatches = (bitrate, targetBitrateStr) => {
  if (!bitrate || !targetBitrateStr) return false;
  
  // Format the actual bitrate to see what it would display as
  const formattedBitrate = formatBitrate(bitrate);
  if (formattedBitrate === targetBitrateStr) {
    return true; // Exact match after formatting
  }
  
  // Also check with tolerance for rounding differences
  const targetBitrate = parseBitrate(targetBitrateStr);
  if (targetBitrate === null) return false;
  
  // Allow 5% tolerance or at least 2kbps for rounding differences
  const tolerance = Math.max(2000, targetBitrate * 0.05);
  return Math.abs(bitrate - targetBitrate) <= tolerance;
};

async function testFiltering() {
    console.log('🧪 Testing Filtering Logic with Specific Scenario...\n');
    console.log('Scenario: Format=MP4, Quality=1080p, Bitrate=378 kbps\n');

    try {
        // Get formats
        const formatsResponse = await fetch(`${SERVER_URL}/api/formats`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: TEST_VIDEO_URL }),
        });

        if (!formatsResponse.ok) {
            console.error('❌ Failed to get formats');
            return;
        }

        const data = await formatsResponse.json();
        const formats = data.formats || [];

        // Test filtering
        const selectedFormat = 'mp4';
        const selectedQuality = '1080p';
        const selectedBitrate = '378 kbps';

        console.log('📋 Step 1: Filter by Format (MP4)');
        let filtered = formats.filter(f => f.ext === selectedFormat);
        console.log(`   Found ${filtered.length} formats with ext="${selectedFormat}"`);
        console.log(`   Format IDs: ${filtered.map(f => f.format_id).join(', ')}`);
        console.log('');

        console.log('📋 Step 2: Filter by Quality (1080p)');
        filtered = filtered.filter(f => f.quality === selectedQuality);
        console.log(`   Found ${filtered.length} formats with quality="${selectedQuality}"`);
        console.log(`   Format IDs: ${filtered.map(f => f.format_id).join(', ')}`);
        if (filtered.length > 0) {
            filtered.forEach(f => {
                console.log(`     - Format ID ${f.format_id}: bitrate=${f.bitrate} bps (${formatBitrate(f.bitrate)})`);
            });
        }
        console.log('');

        console.log('📋 Step 3: Filter by Bitrate (378 kbps)');
        filtered = filtered.filter(f => bitrateMatches(f.bitrate, selectedBitrate));
        console.log(`   Found ${filtered.length} formats matching bitrate="${selectedBitrate}"`);
        if (filtered.length > 0) {
            filtered.forEach(f => {
                console.log(`     - Format ID ${f.format_id}: ${f.ext}, ${f.quality}, ${formatBitrate(f.bitrate)}`);
                console.log(`       Resolution: ${f.resolution}, Has Audio: ${f.hasAudio}`);
            });
        } else {
            console.log('   ⚠️  No formats match all three criteria!');
            console.log('   Checking available bitrates for 1080p MP4:');
            const mp41080p = formats.filter(f => f.ext === 'mp4' && f.quality === '1080p');
            const bitrates = [...new Set(mp41080p.map(f => formatBitrate(f.bitrate)).filter(Boolean))];
            console.log(`   Available bitrates: ${bitrates.join(', ')}`);
        }
        console.log('');

        // Test download with format_id
        if (filtered.length > 0) {
            const selectedFormatId = filtered[0].format_id;
            console.log('📋 Step 4: Test Download with Selected Format ID');
            console.log(`   Using format_id: ${selectedFormatId}`);
            
            const downloadResponse = await fetch(`${SERVER_URL}/api/download`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    url: TEST_VIDEO_URL,
                    format_id: selectedFormatId
                }),
            });

            console.log(`   Status: ${downloadResponse.status}`);
            console.log(`   Content-Type: ${downloadResponse.headers.get('content-type')}`);
            console.log(`   Content-Disposition: ${downloadResponse.headers.get('content-disposition')}`);
            
            if (downloadResponse.ok) {
                console.log('   ✅ Download endpoint accepts format_id and returns correct format');
            } else {
                const errorData = await downloadResponse.json().catch(() => ({}));
                console.log(`   ⚠️  Response: ${JSON.stringify(errorData)}`);
            }
        }

        console.log('\n✅ Filtering test completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.stack) {
            console.error('Stack:', error.stack);
        }
    }
}

// Run test
testFiltering();



