from backend.agent.command_handler import handle_command


print("=" * 40)
print("        ZIVO AI")
print("=" * 40)

while True:

    command = input("\nYou : ")

    if command.lower() == "exit":
        break

    response = handle_command(command)

    print("\nZivo:", response)