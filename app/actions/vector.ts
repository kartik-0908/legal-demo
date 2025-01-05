'use server'
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";

const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-large"
});

export async function extractText() {
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 5000,
        chunkOverlap: 1000,
    });
    const allSplits = await textSplitter.splitDocuments([{
        pageContent:
            ``
        , metadata: { source: "https://storage.googleapis.com/legal-demo-cases/1609_2024_15_1501_57647_Judgement_05-Dec-2024.pdf" }
    }]);

    const pinecone = new PineconeClient();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);
    const vectorStore = new PineconeStore(embeddings, {
        pineconeIndex,
    });

    const res = await vectorStore.addDocuments(allSplits);
    console.log(res.length)

}

export async function findRelevantContent(text: string) {
    const pinecone = new PineconeClient();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);
    const vectorStore = new PineconeStore(embeddings, {
        pineconeIndex,
    });

    const docs = await vectorStore.similaritySearch(text);
    let result = '';
    for (const res of docs) {
        result += ('source url:' + res.metadata.source + '\n');
        result += res.pageContent;
        result += '\n\n';
    }
    console.log(result)
    return result
}

