const games = {};

module.exports = {
    command: 'xo',
    description: 'لعبة XO بين شخصين',
    category: 'ألعاب',
    usage: '.xo @الخصم أو الرد برقم',

    async execute(sock, msg) {
        const chatId = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const senderName = msg.pushName || 'لاعب';

        const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
        const args = text.trim().split(/\s+/);
        const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        // التقاط الرقم من الأمر أو من الرد
        let move = null;

        // 1. إذا كتب .xo 5
        if (args[0] === '.xo' && !isNaN(parseInt(args[1]))) {
            move = parseInt(args[1]);
        }

        // 2. إذا كتب رقم مباشر بدون .xo
        if (!move && !isNaN(parseInt(text.trim()))) {
            move = parseInt(text.trim());
        }

        // 3. إذا رد على رسالة (reply) وكتب رقم
        if (!move && quoted) {
            const msgText = text.trim();
            if (!isNaN(parseInt(msgText))) {
                move = parseInt(msgText);
            }
        }

        // بدء اللعبة
        if (!games[chatId] && mentionedJid) {
            if (mentionedJid === sender) {
                return sock.sendMessage(chatId, { text: 'ما فيك تلعب ضد حالك يا زلمة' }, { quoted: msg });
            }

            games[chatId] = {
                board: ['1','2','3','4','5','6','7','8','9'],
                playerX: sender,
                playerO: mentionedJid,
                turn: 'X',
                status: 'ongoing'
            };

            return sock.sendMessage(chatId, {
                text: `اللعبة بلشت بين:\n❌ ${senderName}\n⭕ @${mentionedJid.split('@')[0]}\n\nالدور على ❌\n${formatBoard(games[chatId].board)}\n\nرد عالرسالة واكتب رقم أو اكتب .xo <رقم>`,
                mentions: [mentionedJid]
            }, { quoted: msg });
        }

        // ما في لعبة؟
        if (!games[chatId]) {
            return sock.sendMessage(chatId, { text: 'ما في لعبة شغالة، بلش وحدة جديدة بـ .xo @الخصم' }, { quoted: msg });
        }

        const game = games[chatId];

        if (game.status !== 'ongoing') {
            delete games[chatId];
            return sock.sendMessage(chatId, { text: 'خلصت اللعبة، بلش وحدة جديدة بـ .xo @الخصم' }, { quoted: msg });
        }

        const currentPlayer = game.turn === 'X' ? game.playerX : game.playerO;

        if (sender !== currentPlayer) {
            return sock.sendMessage(chatId, {
                text: `مو دورك! الدور هلق لـ ${game.turn === 'X' ? '❌' : '⭕'}`
            }, { quoted: msg });
        }

        if (!move || move < 1 || move > 9) {
            return sock.sendMessage(chatId, {
                text: 'اكتب رقم من 1 لـ 9 يا نجم.',
            }, { quoted: msg });
        }

        if (game.board[move - 1] === 'X' || game.board[move - 1] === 'O') {
            return sock.sendMessage(chatId, {
                text: 'الخانة مأخوذة، جرب رقم تاني.',
            }, { quoted: msg });
        }

        game.board[move - 1] = game.turn;

        if (checkWin(game.board, game.turn)) {
            const winner = game.turn === 'X' ? game.playerX : game.playerO;
            const emoji = game.turn === 'X' ? '❌' : '⭕';
            game.status = 'ended';

            await sock.sendMessage(chatId, {
                text: `مبروك! ${emoji} @${winner.split('@')[0]} ربح اللعبة 🎉\n\n${formatBoard(game.board)}`,
                mentions: [winner]
            }, { quoted: msg });

            delete games[chatId];
            return;
        }

        if (!game.board.some(cell => !isNaN(cell))) {
            game.status = 'ended';

            await sock.sendMessage(chatId, {
                text: `تعادل! ولا حدا ربح.\n\n${formatBoard(game.board)}`
            }, { quoted: msg });

            delete games[chatId];
            return;
        }

        game.turn = game.turn === 'X' ? 'O' : 'X';

        return sock.sendMessage(chatId, {
            text: `الدور عـ ${game.turn === 'X' ? '❌' : '⭕'}\n\n${formatBoard(game.board)}`
        }, { quoted: msg });
    }
};

function formatBoard(board) {
    return `
${render(board[0])} | ${render(board[1])} | ${render(board[2])}
---------
${render(board[3])} | ${render(board[4])} | ${render(board[5])}
---------
${render(board[6])} | ${render(board[7])} | ${render(board[8])}
    `.trim();
}

function render(cell) {
    if (cell === 'X') return '❌';
    if (cell === 'O') return '⭕';
    return cell;
}

function checkWin(board, player) {
    const wins = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];
    return wins.some(([a,b,c]) =>
        board[a] === player && board[b] === player && board[c] === player
    );
}