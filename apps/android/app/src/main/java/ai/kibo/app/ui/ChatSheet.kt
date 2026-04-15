package ai.kibo.app.ui

import androidx.compose.runtime.Composable
import ai.kibo.app.MainViewModel
import ai.kibo.app.ui.chat.ChatSheetContent

@Composable
fun ChatSheet(viewModel: MainViewModel) {
  ChatSheetContent(viewModel = viewModel)
}
