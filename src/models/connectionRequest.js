const { Schema, model, default: mongoose } = require("mongoose");

const connectionRequestSchema = new Schema({
    fromUserId: { type: mongoose.Schema.Types.ObjectId, required: true },
    toUserId: { type: mongoose.Schema.Types.ObjectId, required: true },
    status: {
        type: String, enum: {
            values: ["accepted", "rejected", "interested", "ignored"],
            message: `{VALUE} is not supported`
        }
    }


}, { timestamps: true })

connectionRequestSchema.pre("save", function (next) {



    if ((this.fromUserId).equals(this.toUserId)) {
        throw new Error("Can't make connection with self");


    }
    next();
}




);

const ConnectionRequest = model("ConnectionRequest", connectionRequestSchema);
module.exports = ConnectionRequest;