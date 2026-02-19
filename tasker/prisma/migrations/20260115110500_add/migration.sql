-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "sentToId" TEXT;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_sentToId_fkey" FOREIGN KEY ("sentToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
