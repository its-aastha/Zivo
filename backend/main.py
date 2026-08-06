from agent.command_handler import handle_command


print("=" * 50)
print("                      ZIVO AI")
print("=" * 50)

while True:

    command = input("\nYou: ")

    if command.lower() == "exit":
        break

    response = handle_command(command)

    print("\nZivo 👻:", response)