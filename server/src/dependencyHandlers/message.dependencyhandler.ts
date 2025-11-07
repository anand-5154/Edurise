import { MessageController } from "../controllers/implementations/message.controller"
import { MessageRepository } from "../repository/implementations/message.repository"
import { MessageService } from "../services/implementation/Imessage.service"

const messageRepository=new MessageRepository()
const messageService=new MessageService(messageRepository)
export const messageController=new MessageController(messageService)