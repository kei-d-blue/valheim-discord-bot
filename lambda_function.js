const AWS = require('aws-sdk');
const ec2 = new AWS.EC2();

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const instanceId = process.env.EC2_INSTANCE_ID;

    // Discordのインタラクションを検証
    if (body.type === 1) {
      return {
        statusCode: 200,
        body: JSON.stringify({ type: 1 })
      };
    }

    const command = body.data.options[0].name;
    let response;

    switch (command) {
      case 'start':
        await ec2.startInstances({ InstanceIds: [instanceId] }).promise();
        response = 'サーバーを起動中です...';
        break;
      case 'stop':
        await ec2.stopInstances({ InstanceIds: [instanceId] }).promise();
        response = 'サーバーを停止中です...';
        break;
      case 'status':
        const instanceStatus = await ec2.describeInstances({ InstanceIds: [instanceId] }).promise();
        const state = instanceStatus.Reservations[0].Instances[0].State.Name;
        response = `サーバーの状態: ${state}`;
        break;
      default:
        response = '不明なコマンドです。';
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        type: 4,
        data: {
          content: response
        }
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        type: 4,
        data: {
          content: 'エラーが発生しました。'
        }
      })
    };
  }
}; 