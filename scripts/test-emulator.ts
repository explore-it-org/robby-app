/**
 * Example: Test Communication Stack with Emulator
 *
 * This example demonstrates how to use the communication stack
 * with the emulator for development and testing.
 *
 * Run with: npm exec tsx scripts/test-emulator.ts
 */

import { MockRobotManager } from '../src/services/robot-manager-mock';
import { RobotProgram } from '../src/types/robot';

async function main() {
  console.log('🤖 Testing Communication Stack with Emulator\n');

  // Create a mock robot manager (uses emulator)
  const manager = new MockRobotManager();

  // Start discovery
  console.log('📡 Starting robot discovery...');
  const discoveredRobots: string[] = [];

  await manager.startDiscovery(
    (robot) => {
      console.log(`  ✅ Discovered: ${robot.name} (${robot.id})`);
      discoveredRobots.push(robot.id);
    },
    (status, error) => {
      console.log(`  📊 Status: ${status}${error ? ` - ${error.message}` : ''}`);
    }
  );

  // Wait for discovery to complete (3 seconds)
  console.log('  ⏳ Waiting for discovery...\n');
  await new Promise((resolve) => setTimeout(resolve, 4000));

  // Stop discovery
  await manager.stopDiscovery();
  console.log('  🛑 Discovery stopped\n');

  // Show discovered robots
  const robots = manager.getDiscoveredRobots();
  console.log(`📋 Found ${robots.length} robot(s):`);
  robots.forEach((robot) => {
    console.log(`  • ${robot.name} - FW: ${robot.firmwareVersion || 'unknown'}`);
  });
  console.log();

  // Create and connect to the first robot
  if (discoveredRobots.length > 0) {
    const robotId = discoveredRobots[0];
    console.log(`🔌 Connecting to robot: ${robotId}...`);

    try {
      const robot = await manager.createRobot(robotId);
      console.log(`  ✅ Connected!`);
      console.log(`  • Firmware: v${robot.firmwareVersion}`);
      console.log(`  • Protocol: ${robot.protocolVersion}`);
      console.log(`  • Max Instructions: ${robot.protocolVersion === 'V3' ? 100 : robot.protocolVersion === 'V6' ? 2400 : 4096}\n`);

      // Test upload program
      console.log('📤 Uploading test program...');
      const testProgram: RobotProgram = {
        instructions: [
          { leftMotorSpeed: 100, rightMotorSpeed: 100 },
          { leftMotorSpeed: 0, rightMotorSpeed: 100 },
          { leftMotorSpeed: 100, rightMotorSpeed: 0 },
          { leftMotorSpeed: 0, rightMotorSpeed: 0 },
        ],
      };

      robot.onUploadProgress((progress) => {
        console.log(`  📊 Upload progress: ${(progress * 100).toFixed(0)}%`);
      });

      await robot.uploadProgram(testProgram);
      console.log('  ✅ Program uploaded!\n');

      // Test run command
      console.log('▶️  Running program...');
      await robot.run();
      console.log('  ✅ Program execution complete!\n');

      // Test get interval
      console.log('⏱️  Getting interval...');
      const interval = await robot.getInterval();
      console.log(`  ✅ Current interval: ${interval} deciseconds\n`);

      // Test download program
      console.log('📥 Downloading program...');
      robot.onDownloadProgress((progress) => {
        console.log(`  📊 Download progress: ${(progress * 100).toFixed(0)}%`);
      });

      const downloadedProgram = await robot.downloadProgram();
      console.log(`  ✅ Downloaded ${downloadedProgram.instructions.length} instructions\n`);

      // Disconnect
      console.log('🔌 Disconnecting...');
      await robot.disconnect();
      console.log('  ✅ Disconnected\n');

      console.log('🎉 All tests passed!');
    } catch (error) {
      console.error('❌ Error:', error);
    }
  } else {
    console.log('❌ No robots discovered');
  }
}

// Run the example
main().catch(console.error);
