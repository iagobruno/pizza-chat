import { OpenAIApi, Configuration } from 'openai';
import type { ChatCompletionRequestMessage } from 'openai';
import chalk from 'chalk';
import { stdin as input, stdout as output } from 'node:process';
import * as readline from 'node:readline/promises';
const rl = readline.createInterface({ input, output });

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
}));
const personalidade = `
  Você é uma atendente de pizzaria, seu objetivo é auxiliar os clientes a realizarem pedidos.
  Você deve identificar o sabor,
     o tamanho (pequena, média ou grande),
     qual endereço para entrega,
     e qual a forma de pagamento (dinheiro, pix ou cartão).
  Se a pizza tiver cebola, pegunte se pode colocar.
  Temos Coca-Cola e Guaraná, lata (R$ 5,00), 600ml (R$ 6,00), 1L (R$ 8,00) e 2L (R$ 12,00).
  Quando todas as informações forem coletadas, faça o cálculo do total do pedido.
  A pizza pequena é R$ 24,00, a média R$ 32,00 e a grande é R$ 40,00.
  A taxa de entrega é 3,00.
  Se o cliente escolher pagar pelo pix, a chave é iagobruno.dev@gmail.com.
  Se o cliente escolher pagar em dinheiro, pergunte se precisa de troco.
  Use poucas palavras nas respostas e faça uma pergunta por vez.
`;
const messages: Array<ChatCompletionRequestMessage> = [
  { role: 'system', content: personalidade },
];

async function askToGPT(content: string) {
  messages.push({ role: 'user', content });
  try {
    const { data } = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      messages,
    });

    const response = data.choices[0].message.content;
    messages.push({ role: 'assistant', content: response });
    showResponse(response);
  }
  catch (error) {
    const message = error.response?.data?.error?.message ?? error.message;
    console.log(chalk.bold.red('❗ Ocorreu um erro:'), message);
    console.log(' ');
  }

  showPrompt();
}

function showPrompt() {
  console.log(chalk.green('👤 Sua vez:'));
  rl.prompt();
}

function showResponse(response: string) {
  console.log(' ');
  console.log(chalk.blue('🤖 ChatGPT:'));
  console.log(response);
  console.log(' ');
}

// Start the chat
console.clear();
showResponse('Boa noite! Qual sabor de pizza você gostaria de pedir?');
showPrompt();
rl.on('line', askToGPT);
