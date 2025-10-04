const { Schema, model, default: mongoose } = require("mongoose");

const connectionRequestSchema = new Schema({
    fromUserId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    toUserId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    status: {
        type: String, enum: {
            values: ["accepted", "rejected", "interested", "ignored"],
            message: `{VALUE} is not supported`
        }
    }


}, { timestamps: true })

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

connectionRequestSchema.pre("save", function (next) {



    if ((this.fromUserId).equals(this.toUserId)) {
        throw new Error("Can't make connection with self");


    }
    next();
}




);

const ConnectionRequest = model("ConnectionRequest", connectionRequestSchema);
module.exports = ConnectionRequest;